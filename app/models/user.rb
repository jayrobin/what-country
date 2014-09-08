class User < ActiveRecord::Base
  validates_presence_of :username
  has_many :pins
  has_many :questions, through: :pins

  def set_location(x, y)
    update_attributes(x: x, y: y)
  end

  def get_unanswered_question
    (Question.all - questions).sample
  end
end
