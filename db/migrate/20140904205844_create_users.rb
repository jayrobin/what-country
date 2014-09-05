class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :username, null: false
    end

    change_table :pins do |t|
      t.belongs_to :user
    end
  end
end
