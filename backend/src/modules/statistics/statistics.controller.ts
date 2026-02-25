import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';

@ApiTags('统计')
@Controller('statistics')
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: '获取统计数据' })
  async getStatistics() {
    return this.statisticsService.getStatistics();
  }
}
