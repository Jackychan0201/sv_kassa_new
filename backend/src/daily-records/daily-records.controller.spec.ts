import { Test, TestingModule } from '@nestjs/testing';
import { DailyRecordsController } from './daily-records.controller';

describe('DailyRecordsController', () => {
  let controller: DailyRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyRecordsController],
    }).compile();

    controller = module.get<DailyRecordsController>(DailyRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
