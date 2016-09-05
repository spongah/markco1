class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable 
  devise :database_authenticatable, :registerable, :confirmable, 
         :recoverable, :rememberable, :trackable, :validatable
  # validates :displayname, presence: true
  validates :email, presence: true
  validates_format_of :email,:with => Devise.email_regexp
  validates :firstname, presence: true
  validates :lastname, presence: true

end
