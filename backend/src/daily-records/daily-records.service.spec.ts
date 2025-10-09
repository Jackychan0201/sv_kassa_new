import { Test, TestingModule } from '@nestjs/testing';
import { DailyRecordsService } from './daily-records.service';

describe('DailyRecordsService', () => {
  let service: DailyRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyRecordsService],
    }).compile();

    service = module.get<DailyRecordsService>(DailyRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
