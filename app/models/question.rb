class Question < ActiveRecord::Base
  validates_presence_of :content

  def self.get_random_question
    Question.limit(1).order("RANDOM()").first
  end
end
