class AddCategoryToQuestions < ActiveRecord::Migration
  def change
    change_table :questions do |t|
      t.belongs_to :category
    end
  end
end
