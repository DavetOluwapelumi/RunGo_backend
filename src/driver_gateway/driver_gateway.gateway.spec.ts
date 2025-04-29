import { Test, TestingModule } from '@nestjs/testing';
import { DriverGatewayGateway } from './driver_gateway.gateway';

describe('DriverGatewayGateway', () => {
  let gateway: DriverGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DriverGatewayGateway],
    }).compile();

    gateway = module.get<DriverGatewayGateway>(DriverGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
