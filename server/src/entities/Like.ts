import { BaseEntity, Entity, JoinColumn, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Cafe } from './Cafe'
import { User } from './User'

@Entity()
export class Like extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  // NOTE: ManyToOne annotation allows us to omit @JoinColumn.
  @ManyToOne(() => User, user => user.likes)
  @JoinColumn({ name: "userId" })
  user: User

  @ManyToOne(() => Cafe, cafe => cafe.likes)
  @JoinColumn({ name: "cafeId" })
  cafe: Cafe

  @Column({ nullable: false })
  userId: number

  @Column({ nullable: false })
  cafeId: number

}
