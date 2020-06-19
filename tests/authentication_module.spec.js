const assert=require('chai').assert

describe("Tests authentication module can connect",function(){
  it("import",function(){
    let Auth=require('node_auth_module')
    let auth=new Auth(".config_auth.js")
    assert.exists(auth.auth,"check it was loaded") 
    assert.exists(auth.session,"check it was loaded")     
  })
})
