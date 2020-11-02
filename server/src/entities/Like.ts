import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm'
import { User } from './User';
import { Cafe } from './Cafe';

@Entity()
export class Like extends BaseEntity {
    // NOTE: ManyToOne annotation allows us to omit @JoinColumn.
    @ManyToOne(type => User, user => user.likes)
    user: User

    @ManyToOne(type => Cafe, cafe => cafe.likes)
    cafe: Cafe


}
