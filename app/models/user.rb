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
end
