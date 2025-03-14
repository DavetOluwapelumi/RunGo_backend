import { USER_INFORMATION } from 'src/constants/tableNames';
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity(USER_INFORMATION)
export default class User {
  @PrimaryColumn()
  identifier: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateAdded: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUpdatedAt: Date;

  @Column()
  isVerified: boolean;

  @BeforeInsert()
  async setIdentifier() {
    this.identifier = ulid();
  }
}
