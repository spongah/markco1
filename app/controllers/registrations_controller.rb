class RegistrationsController < Devise::RegistrationsController

  def edit
    @user = User.find(current_user.id)
    # if (File.exist?('./public/' + @user.id.to_s + '.png'))
    #  iconFile = '/' + @user.id.to_s + '.png'
    # else
    #  iconFile = '/noavatar.png'
    # end
    # @user.icon = iconFile
    gon.watch.user = @user
    super
  end


  private

  def sign_up_params
    params.require(:user).permit(:firstname, :lastname, :email, :password, :password_confirmation)
  end

  def account_update_params
    params.require(:user).permit(:firstname, :lastname, :email, :password, :password_confirmation, :current_password)
  end


  protected

  def after_inactive_sign_up_path_for(resource)
    new_user_session_path
  end

  def after_sign_up_path_for(resource)
    root_path
  end

end