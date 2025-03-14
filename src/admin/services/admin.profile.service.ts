import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonAuthService } from '../../auth/auth.service.common';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Admin } from '../../entities/admin.entity';

@Injectable()
export class AdminProfileService {
  constructor(
    @Inject(CommonAuthService)
    private readonly commonAuthService: CommonAuthService,
    @Inject(AdminService)
    private readonly adminService: AdminService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}
}
