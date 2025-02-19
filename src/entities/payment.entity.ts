import { PAYMENT_INFORMATION } from 'src/constants/tableNames';
import { Entity } from 'typeorm';

@Entity(PAYMENT_INFORMATION)
export default class Payment {}
