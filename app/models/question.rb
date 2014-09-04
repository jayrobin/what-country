class Question < ActiveRecord::Base
  validates_presence_of :content

  def self.get_random_question
    Question.limit(1).order("RANDOM()").first
  end

  def get_all_pins_as_json
    pins.map { |pin| { x: pin.x, y: pin.y } }.to_json
  end
end
