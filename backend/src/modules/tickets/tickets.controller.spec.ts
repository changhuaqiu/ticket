import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketStatusDto, AssignTicketDto, QueryTicketDto } from './dto/ticket.dto';
import { TicketStatus, TicketCategory, TicketPriority } from './entities/ticket.entity';
import { UserRole } from '../auth/entities/user.entity';

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
            updateStatus: jest.fn(),
            assign: jest.fn(),
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
        category: TicketCategory.COMPLAINT,
        priority: TicketPriority.HIGH,
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          id: '1',
          ticketNo: 'TG-001',
          title: '测试工单',
          description: '测试工单描述',
          category: TicketCategory.COMPLAINT,
          priority: TicketPriority.HIGH,
          status: TicketStatus.NEW,
          submitterId: 'user123',
          submitter: {
            id: 'user123',
            username: 'testuser',
            password: 'password',
            name: '测试用户',
            email: 'test@example.com',
            role: UserRole.SUBMITTER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          handlerId: 'handler456', // 避免 null 值
          handler: {
            id: 'handler456',
            username: 'handler456',
            password: 'password',
            name: '处理人',
            email: 'handler456@example.com',
            role: UserRole.HANDLER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          slaDueAt: new Date(Date.now() + 3600000),
          resolvedAt: new Date(Date.now() + 3600000), // 避免 null 值
          closedAt: new Date(Date.now() + 3600000), // 避免 null 值
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          comments: [],
          histories: [],
        },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      const req = { user: { userId: 'user123' } };
      expect(await controller.create(createTicketDto, req)).toEqual(result);
    });
  });

  describe('查询工单列表', () => {
    it('should return ticket list with pagination', async () => {
      const query: QueryTicketDto = {
        page: 1,
        pageSize: 10,
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          list: [
            {
              id: '1',
              ticketNo: 'TG-001',
              title: '工单1',
              status: TicketStatus.NEW,
              priority: TicketPriority.HIGH,
              slaDueAt: new Date(Date.now() + 3600000),
              submitter: {
                id: 'user123',
                username: 'testuser',
                password: 'password',
                name: '测试用户',
                email: 'test@example.com',
                role: UserRole.SUBMITTER,
                department: '技术部',
                createdAt: new Date(),
                updatedAt: new Date(),
                submittedTickets: [],
                handledTickets: [],
                comments: [],
              },
              handler: {
                id: 'handler456',
                username: 'handler456',
                password: 'password',
                name: '处理人',
                email: 'handler456@example.com',
                role: UserRole.HANDLER,
                department: '技术部',
                createdAt: new Date(),
                updatedAt: new Date(),
                submittedTickets: [],
                handledTickets: [],
                comments: [],
              },
              createdAt: new Date(),
            },
            {
              id: '2',
              ticketNo: 'TG-002',
              title: '工单2',
              status: TicketStatus.PROCESSING,
              priority: TicketPriority.MEDIUM,
              slaDueAt: new Date(Date.now() + 7200000),
              submitter: {
                id: 'user456',
                username: 'user456',
                password: 'password',
                name: '另一个用户',
                email: 'user456@example.com',
                role: UserRole.SUBMITTER,
                department: '产品部',
                createdAt: new Date(),
                updatedAt: new Date(),
                submittedTickets: [],
                handledTickets: [],
                comments: [],
              },
              handler: {
                id: 'handler789',
                username: 'handler789',
                password: 'password',
                name: '处理人',
                email: 'handler789@example.com',
                role: UserRole.HANDLER,
                department: '技术部',
                createdAt: new Date(),
                updatedAt: new Date(),
                submittedTickets: [],
                handledTickets: [],
                comments: [],
              },
              createdAt: new Date(),
            },
          ],
          total: 2,
          page: 1,
          pageSize: 10,
        },
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll(query)).toEqual(result);
    });
  });

  describe('更新工单状态', () => {
    it('should update ticket status to processing', async () => {
      const updateStatusDto: UpdateTicketStatusDto = {
        status: TicketStatus.PROCESSING,
        remark: '开始处理',
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          id: '1',
          ticketNo: 'TG-001',
          title: '测试工单',
          description: '测试工单描述',
          category: TicketCategory.COMPLAINT,
          priority: TicketPriority.HIGH,
          status: TicketStatus.PROCESSING,
          submitterId: 'user123',
          submitter: {
            id: 'user123',
            username: 'testuser',
            password: 'password',
            name: '测试用户',
            email: 'test@example.com',
            role: UserRole.SUBMITTER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          handlerId: 'handler456',
          handler: {
            id: 'handler456',
            username: 'handler456',
            password: 'password',
            name: '处理人',
            email: 'handler456@example.com',
            role: UserRole.HANDLER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          slaDueAt: new Date(Date.now() + 3600000),
          resolvedAt: new Date(Date.now() + 3600000),
          closedAt: new Date(Date.now() + 3600000),
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          comments: [],
          histories: [],
        },
      };

      jest.spyOn(service, 'updateStatus').mockResolvedValue(result);

      const req = { user: { userId: 'user123' } };
      expect(await controller.updateStatus('1', updateStatusDto, req)).toEqual(result);
    });
  });

  describe('分配工单', () => {
    it('should assign ticket to handler', async () => {
      const assignDto: AssignTicketDto = {
        handlerId: 'handler456',
      };

      const result = {
        code: 0,
        message: '成功',
        data: {
          id: '1',
          ticketNo: 'TG-001',
          title: '测试工单',
          description: '测试工单描述',
          category: TicketCategory.COMPLAINT,
          priority: TicketPriority.HIGH,
          status: TicketStatus.PROCESSING,
          submitterId: 'user123',
          submitter: {
            id: 'user123',
            username: 'testuser',
            password: 'password',
            name: '测试用户',
            email: 'test@example.com',
            role: UserRole.SUBMITTER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          handlerId: 'handler456',
          handler: {
            id: 'handler456',
            username: 'handler456',
            password: 'password',
            name: '处理人',
            email: 'handler456@example.com',
            role: UserRole.HANDLER,
            department: '技术部',
            createdAt: new Date(),
            updatedAt: new Date(),
            submittedTickets: [],
            handledTickets: [],
            comments: [],
          },
          slaDueAt: new Date(Date.now() + 3600000),
          resolvedAt: new Date(Date.now() + 3600000),
          closedAt: new Date(Date.now() + 3600000),
          attachments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          comments: [],
          histories: [],
        },
      };

      jest.spyOn(service, 'assign').mockResolvedValue(result);

      const req = { user: { userId: 'user123' } };
      expect(await controller.assign('1', assignDto, req)).toEqual(result);
    });
  });
});