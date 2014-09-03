class CreatePins < ActiveRecord::Migration
  def change
    create_table :pins do |t|
      t.integer :x, null: false
      t.integer :y, null: false

      t.timestamps
    end
  end
end
