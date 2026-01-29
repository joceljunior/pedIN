import Parse from '../services/parse'

// Script para criar usuário master
// Execute uma vez para configurar o usuário master

export async function criarUsuarioMaster() {
  try {
    // Tenta fazer login para verificar se existe
    await Parse.User.logIn('master', 'master123')
    await Parse.User.logOut()
    console.log('Usuário master já existe!')
    return
  } catch (loginError) {
    // Usuário não existe, vamos criar
    if (loginError.code === 101) {
      try {
        const user = new Parse.User()
        user.set('username', 'master')
        user.set('password', 'master123')
        user.set('role', 'master')
        
        await user.signUp()
        await Parse.User.logOut()
        console.log('Usuário master criado com sucesso!')
      } catch (signupError) {
        // Erro 202 = username já existe
        if (signupError.code === 202) {
          console.log('Usuário master já existe!')
        } else {
          console.error('Erro ao criar usuário master:', signupError)
        }
      }
    } else {
      console.log('Usuário master já existe ou erro de conexão')
    }
  }
}
