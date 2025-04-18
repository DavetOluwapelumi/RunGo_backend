import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert} from 'typeorm';
import { ulid } from 'ulid';

@Entity('otp')
export class OtpEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type:'varchar', unique: true, length: 6  })
  identifier: string;

  @Column({ type: 'varchar', length: 6 })
  token: string;

  @Column({type: "bigint"})
  validityPeriod: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  setDefaults() {
    this.identifier = ulid();
    this.token = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    this.validityPeriod = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
  }
}