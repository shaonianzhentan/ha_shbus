class MoreInfoShbus extends HTMLElement {
  constructor() {
      super()
      const shadow = this.attachShadow({mode: 'open'});
      const div = document.createElement('div', {'class': 'root'});
      div.innerHTML = `
             <div class="title">
                  <b class="from_to"></b>
                  <br/>
                  <span class="operation_time"></span>
                  <div class="title-info">
                   
                  </div>
              </div>
              <div class="line"></div>
      `
      shadow.appendChild(div);
      
      // 设置样式
      const style = document.createElement('style');
      style.textContent = `
       .title{
          background-color: var(--primary-color);
          color:white;
          padding:10px 20px;
          line-height:25px;
       }
       .title span{font-size:14px;}
       .title-info{border-top:1px dashed silver;padding-top:10px;margin-top:10px;font-size:14px;}
       .line{}
       .line-item{border:1px solid #eee;margin-top:10px;padding:10px;}
       .line-item p{padding:0;margin:0;cursor:pointer;}
       .line-item div{border-top:1px dashed silver;padding-top:10px;margin-top:10px;font-size:14px;
          color: var(--primary-color);
          }
          
      `;
      shadow.appendChild(style);   
      this.shadow = shadow
      
      this.info = document.createElement('div')
      
  }
  // 自定义初始化方法
  render(){
      let attr = this.stateObj.attributes
      // console.log(attr)
      this.shadow.querySelector('.from_to').innerHTML = `${attr.from}&emsp;→&emsp;${attr.to}`
      this.shadow.querySelector('.operation_time').innerHTML = `运营时间：${attr.start_at} - ${attr.end_at}`
      
      if(attr.bus_status === 'running'){
          this.shadow.querySelector('.title-info').innerHTML = `公交车【${attr.plate_number}】 距 【${attr.stop_name}】 <br/> 还有${attr.stop_interval}站，${attr.distance}米，约${this.stateObj.state}分钟`    
      }else{
          this.shadow.querySelector('.title-info').innerHTML = `【${attr.stop_name}】 等待发车`
      }
      
      let line = this.shadow.querySelector('.line')
      if(line.childNodes.length === 0){
          let stops = JSON.parse(attr.stops)
          let fragment = document.createDocumentFragment();
          stops.forEach((ele, index)=>{
              let div= document.createElement('div')
              div.classList.add('line-item')
              div.innerHTML = `<p>${ele.stop_id}${ele.stop_name}</p>`
              div.onclick = () => {
                  // console.log(this, index)                    
                  if(div.loading) return;
                  div.loading = true
                  
                  let auth = this.hass.auth
                  if(auth.expired){
                      auth.refreshAccessToken()
                  }
                  // 发送查询请求
                  fetch('/ha_shbus-api',{method:'post',
                      body:JSON.stringify({
                          name: attr.bus_name,
                          direction: attr.direction,
                          stop_id: index + 1
                      }),
                      headers: {
                          'authorization': `${auth.data.token_type} ${auth.accessToken}`
                      }
                  }).then(res=>res.json()).then(res=>{
                      // console.log(res)
                      if(res.status==='running'){
                          this.info.innerHTML = `${res.plate_number} 还有${res.stop_interval}站，${res.distance}米，约${Math.floor(res.time/60)}分钟`    
                      }else{
                          this.info.innerHTML = `等待发车`
                      }
                      div.appendChild(this.info)
                  }).finally(()=>{
                      div.loading = false
                  })
              }
              fragment.appendChild(div)
          })
          line.appendChild(fragment)   
      }        
  }    
  
  /* --------------------生命周期回调函数-------------------------------- */
  
  // 当 custom element首次被插入文档DOM时，被调用。
  connectedCallback(){
      // console.log('当 custom element首次被插入文档DOM时，被调用。')
      // let obj = this.stateObj
      // this.attributes.set('attr', obj.attributes)
      // console.log(obj)
      // console.log('%O', this)        
      // this.render()
  }
  
  // 当 custom element从文档DOM中删除时，被调用。
  disconnectedCallback(){
      // console.log('当 custom element从文档DOM中删除时，被调用。')
      this.shadow.querySelector('.line').innerHTML = ''
  }
        
  get stateObj(){
      return this._stateObj
  }
  
  set stateObj(value){
      this._stateObj = value
      this.render()
  }
}

customElements.define('more-info-shbus', MoreInfoShbus);