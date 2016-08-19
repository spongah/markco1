class AddTrackingToUser < ActiveRecord::Migration
  def change
  	add_column :users, :tracking, :boolean
  end
end
