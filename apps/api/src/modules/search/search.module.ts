import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { PostgresSearchProvider } from './providers/postgres.search.provider';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    {
      provide: 'SearchProvider',
      useClass: PostgresSearchProvider,
    },
  ],
  exports: [SearchService],
})
export class SearchModule {}
