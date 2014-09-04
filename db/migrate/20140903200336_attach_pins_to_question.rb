class AttachPinsToQuestion < ActiveRecord::Migration
  def change
    change_table :pins do |t|
      t.belongs_to :question
    end
  end
end
