import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';


describe('JobsService', () => {
  let service: JobsService;

  const mockJobModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  const mockAppModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockSavedJobModel = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: getModelToken('Job'), useValue: mockJobModel },
        { provide: getModelToken('Application'), useValue: mockAppModel },
        { provide: getModelToken('SavedJob'), useValue: mockSavedJobModel },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  //! Test Job Creation (EMPLOYER)
  it('should create job if user is employer', async () => {
    const dto = { title: "Backend Developer" };
    const user = { _id: '123', role: 'EMPLOYER' };

    mockJobModel.create.mockResolvedValue({ ...dto, company: '123' });

    const result = await service.create(dto as any, user);

    expect(mockJobModel.create).toHaveBeenCalledWith({
      ...dto,
      company: '123',
    });

    expect(result.title).toBe('Backend Developer');
  });

  //! Job Creation Error if not EMPLOYER
  it('should throw if user is not employer', async () => {
    const dto = { title: 'Backend Developer' };
    const user = { _id: '123', role: 'JOBSEEKER' };

    await expect(service.create(dto as any, user))
      .rejects
      .toThrow(ForbiddenException);
  });

  //! 404 if no job found by id
  it('should throw if job not found', async () => {
    mockJobModel.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(null),
    });

    await expect(service.findOne('abc'))
      .rejects
      .toThrow(NotFoundException);
  });

  //! Job Found with Application Status
  it('should return job with applicationStatus', async () => {
    const jobId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    const job = {
      _id: jobId,
      toObject: () => ({ _id: jobId }),
    };

    mockJobModel.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue(job),
    });
    mockAppModel.findOne.mockResolvedValue({ status: 'PENDING' });

    const result = await service.findOne(jobId.toString(), userId.toString());

    expect(result.applicationStatus).toBe('PENDING');
  });

  //! Throw error if not owner
  it('should throw if user is not owner', async () => {
    const job = {
      company: new Types.ObjectId(),
    };

    mockJobModel.findById.mockResolvedValue(job);

    const user = { _id: new Types.ObjectId() };

    await expect(
      service.update('id', {}, user),
    ).rejects.toThrow(ForbiddenException);
  });

  mockJobModel.find.mockReturnValue({
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue([
      { _id: new Types.ObjectId(), title: 'Dev' },
    ]),
  });

  //! Find all jobs with saved and applied status
  it('should return jobs with saved and applied status', async () => {
    const jobId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    mockJobModel.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([{ _id: jobId }]),
    });

    mockSavedJobModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { job: jobId },
      ]),
    });

    mockAppModel.find.mockReturnValue({
      select: jest.fn().mockResolvedValue([
        { job: jobId, status: 'ACCEPTED' },
      ]),
    });

    const result = await service.findAll({
      userId: userId.toString(),
    } as any);

    expect(result[0].isSaved).toBe(true);
    expect(result[0].applicationStatus).toBe('ACCEPTED');
  });
});
