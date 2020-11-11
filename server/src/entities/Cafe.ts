import { Column, Entity, OneToMany, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'
import { Like } from './Like'

@Entity()
export class Cafe extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ type: 'double', nullable: false })
  longitude: number

  @Column({ type: 'double', nullable: false })
  latitude: number

  // NOTE: arrays like this aren't supporte in mysql.
  // We need to make a joining table images <> Cafe.
  //@Column({ nullable: true })
  //images: string[]

  @OneToMany(() => Like, like => like.cafe)
  likes: Like[]
}
