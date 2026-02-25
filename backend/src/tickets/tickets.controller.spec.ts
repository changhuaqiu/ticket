import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  describe('创建工单', () => {
    it('should create a ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        title: '测试工单',
        description: '测试工单描述',
        priority: 'high',
        reporterId: 'user123',
      };

      const result = {
        id: '1',
        ...createTicketDto,
        status: 'new',
        createdAt: new Date(),
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createTicketDto)).toEqual({
        code: 200,
        message: '成功',
        data: result,
      });
    });

    it('should throw error when title is empty', async () => {
      const createTicketDto: CreateTicketDto = {
        title: '',
        description: '测试工单描述',
        priority: 'high',
        reporterId: 'user123',
      };

      await expect(controller.create(createTicketDto)).rejects.toThrow();
    });
  });

  describe('查询工单', () => {
    it('should return all tickets', async () => {
      const result = [
        { id: '1', title: '工单1', status: 'new' },
        { id: '2', title: '工单2', status: 'processing' },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toEqual({
        code: 200,
        message: '成功',
        data: result,
      });
    });
  });

  describe('更新工单', () => {
    it('should update ticket status', async () => {
      const updateTicketDto: UpdateTicketDto = {
        status: 'processing',
      };

      const result = {
        id: '1',
        title: '测试工单',
        status: 'processing',
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', updateTicketDto)).toEqual({
        code: 200,
        message: '成功',
        data: result,
      });
    });
  });
});