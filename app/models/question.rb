class Question < ActiveRecord::Base
  validates_presence_of :content
  has_many :pins
  belongs_to :category

  def self.get_random_question
    Question.limit(1).order("RANDOM()").first
  end

  def get_pin_data
    { id: id, content: content, pins: pins.map { |pin| { x: pin.x, y: pin.y } } }
  end

  def get_pin_data_for_user(user_id)
    pin = pins.where(user_id: user_id).first

    pin.nil? ? {} : { x: pin.x, y: pin.y }
  end
end
