require 'json'

class Pin < ActiveRecord::Base
  validates_presence_of :x, :y
  belongs_to :question

  def self.all_to_json
    Pin.all.map { |pin| { x: pin.x, y: pin.y } }.to_json
  end
end
