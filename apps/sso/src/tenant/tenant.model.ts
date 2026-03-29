import {
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Role } from '../enums/role.enum';

@Table({ tableName: 'tenants', timestamps: true })
export class Tenant extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'first_name' })
  declare firstName: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'last_name' })
  declare lastName: string;

  @Default(Role.USER)
  @Column(DataType.ENUM(...Object.values(Role)))
  declare role: Role;
}
