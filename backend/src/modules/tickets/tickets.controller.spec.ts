import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, QueryTicketDto, UpdateTicketStatusDto, AssignTicketDto } from './dto/ticket.dto';
import { TicketStatus, TicketCategory, TicketPriority } from './entities/ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    assign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  describe('创建工单', () => {
    it('should create a ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        title: '测试工单',
        description: '这是一个测试工单',
        category: TicketCategory.COMPLAINT,
        priority: TicketPriority.URGENT,
      };

      const mockResult = {
        code: 0,
        data: {
          id: '123',
          ...createTicketDto,
          status: TicketStatus.NEW,
          ticketNo: 'TK20260226001',
          createdAt: new Date(),
        },
      };

      mockTicketsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(createTicketDto, { user: { userId: 'user1' } });

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createTicketDto,
        }),
        'user1',
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('获取工单列表', () => {
    it('should return a list of tickets', async () => {
      const mockTickets = [
        {
          id: '1',
          ticketNo: 'TK20260226001',
          title: '测试工单1',
          status: TicketStatus.NEW,
          category: TicketCategory.INQUIRY,
          priority: TicketPriority.MEDIUM,
          createdAt: new Date(),
        },
        {
          id: '2',
          ticketNo: 'TK20260226002',
          title: '测试工单2',
          status: TicketStatus.PROCESSING,
          category: TicketCategory.SUGGESTION,
          priority: TicketPriority.URGENT,
          createdAt: new Date(),
        },
      ];

      mockTicketsService.findAll.mockResolvedValue({
        code: 0,
        data: mockTickets,
      });

      const query: QueryTicketDto = {};
      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        code: 0,
        data: mockTickets,
      });
    });
  });

  describe('获取单张工单', () => {
    it('should return a single ticket', async () => {
      const mockTicket = {
        id: '1',
        ticketNo: 'TK20260226001',
        title: '测试工单',
        description: '这是一个测试工单',
        status: TicketStatus.NEW,
        category: TicketCategory.COMPLAINT,
        priority: TicketPriority.URGENT,
        submitterId: 'user1',
        handlerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTicketsService.findOne.mockResolvedValue({
        code: 0,
        data: mockTicket,
      });

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual({
        code: 0,
        data: mockTicket,
      });
    });
  });

  describe('更新工单状态', () => {
    it('should update ticket status', async () => {
      const newStatus: TicketStatus = TicketStatus.PROCESSING;
      const mockResult = {
        code: 0,
        data: {
          id: '123',
          ticketNo: 'TK20260226001',
          title: '测试工单',
          status: newStatus,
        },
      };

      mockTicketsService.updateStatus.mockResolvedValue(mockResult);

      const result = await controller.updateStatus('123', { status: newStatus }, { user: { userId: 'user1' } });

      expect(service.updateStatus).toHaveBeenCalledWith('123', { status: newStatus }, 'user1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('分配处理人', () => {
    it('should assign a handler to a ticket', async () => {
      const handlerId = 'user2';
      const mockResult = {
        code: 0,
        data: {
          id: '123',
          ticketNo: 'TK20260226001',
          title: '测试工单',
          handlerId: handlerId,
        },
      };

      mockTicketsService.assign.mockResolvedValue(mockResult);

      const result = await controller.assign('123', { handlerId }, { user: { userId: 'user1' } });

      expect(service.assign).toHaveBeenCalledWith('123', { handlerId }, 'user1');
      expect(result).toEqual(mockResult);
    });
  });
});
