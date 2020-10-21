import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { SurveyQuestion } from './SurveyQuestion'

@Entity()
export class Survey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ nullable: true })
  currQuestion: number

  @OneToMany(() => SurveyQuestion, question => question.survey, { eager: true })
  questions: SurveyQuestion[]

  get isStarted() {
    return this.currQuestion != null
  }

  get isCompleted() {
    return this.isStarted && this.currQuestion >= this.questions.length
  }

  get currentQuestion() {
    if (!this.isStarted || this.isCompleted) {
      return null
    }

    return this.questions.sort((a, b) => a.id - b.id)[this.currQuestion]
  }
}
