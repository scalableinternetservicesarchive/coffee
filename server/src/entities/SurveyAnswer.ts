import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { SurveyQuestion } from './SurveyQuestion'

@Entity()
export class SurveyAnswer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column('text')
  answer: string

  @ManyToOne(() => SurveyQuestion, question => question.answers)
  question: SurveyQuestion
}
