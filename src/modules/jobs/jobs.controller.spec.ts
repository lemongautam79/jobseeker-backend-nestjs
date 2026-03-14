import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

describe('JobsController', () => {
  let controller: JobsController;

  const mockService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: JobsService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  it('should call service.create', async () => {
    mockService.create.mockResolvedValue({ title: 'Dev' });

    const result = await controller.create(
      { title: 'Dev' } as any,
      { _id: '1', role: 'EMPLOYER' },
    );

    expect(result.title).toBe('Dev');
  });
});
