class Pin < ActiveRecord::Base
  validates_presence_of :x, :y
  belongs_to :question
  belongs_to :user

  def self.all_to_json
    Pin.all.map { |pin| { x: pin.x, y: pin.y } }.to_json
  end

  def update_position(params)
    self.x = params[:x]
    self.y = params[:y]
    self.save!
  end
end
