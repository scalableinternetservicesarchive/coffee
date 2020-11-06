import { BaseEntity, Entity, ManyToOne } from 'typeorm'
import { Cafe } from './Cafe'
import { User } from './User'

@Entity()
export class Like extends BaseEntity {
  // NOTE: ManyToOne annotation allows us to omit @JoinColumn.
  @ManyToOne(type => User, user => user.likes)
  user: User

  @ManyToOne(type => Cafe, cafe => cafe.likes)
  cafe: Cafe
}
