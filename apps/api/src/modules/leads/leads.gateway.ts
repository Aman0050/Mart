import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect, WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  role: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/leads',
})
export class LeadsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LeadsGateway.name);
  private connectedUsers = new Map<string, string>(); // userId → socketId

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) throw new WsException('Unauthorized');

      const payload = this.jwtService.verify(token, {
        secret: this.config.get('jwt.accessSecret'),
      });

      client.userId = payload.sub;
      client.role = payload.role;
      this.connectedUsers.set(payload.sub, client.id);

      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) this.connectedUsers.delete(client.userId);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_lead')
  async handleJoinLead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leadId: string },
  ) {
    // Verify user belongs to this lead
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: data.leadId,
        OR: [{ buyerId: client.userId }, { sellerId: client.userId }],
      },
    });

    if (!lead) throw new WsException('Lead not found or access denied');

    client.join(`lead:${data.leadId}`);
    return { event: 'joined', leadId: data.leadId };
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { leadId: string; message: string; messageType?: string },
  ) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: data.leadId,
        OR: [{ buyerId: client.userId }, { sellerId: client.userId }],
      },
    });

    if (!lead) throw new WsException('Lead not found or access denied');

    // Save message to DB
    const savedMessage = await this.prisma.leadMessage.create({
      data: {
        leadId: data.leadId,
        senderId: client.userId,
        message: data.message,
        messageType: (data.messageType as 'text') || 'text',
      },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });

    // Broadcast to all users in the lead room
    this.server.to(`lead:${data.leadId}`).emit('new_message', savedMessage);

    // Update lead status to contacted if it was new
    if (lead.status === 'new' && lead.sellerId === client.userId) {
      await this.prisma.lead.update({
        where: { id: data.leadId },
        data: { status: 'contacted' },
      });
    }

    return savedMessage;
  }

  // Called from LeadsService to notify users
  sendNotification(userId: string, event: string, data: unknown) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
