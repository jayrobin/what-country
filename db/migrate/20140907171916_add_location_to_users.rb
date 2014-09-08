class AddLocationToUsers < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.integer :x
      t.integer :y
    end
  end
end
