class User < ActiveRecord::Base
  validates_presence_of :username
  has_many :pins
  has_many :questions, through: :pins

  def set_location(location)
    update_attributes(location)
  end

  def get_unanswered_question
    (Question.all - questions).sample
  end

  def get_unanswered_questions_as_json
    json = []
    Category.all.each do |category|
      questions = []
      category.questions.each do |question|
        questions << { id: question.id, content: question.content }
      end
      json << { category: category.name, questions: questions }
    end

    json.to_json
  end
end
