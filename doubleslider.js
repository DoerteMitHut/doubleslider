const range = (n)=>Array.from({length:n},(_,i)=>0+i);
        const toFindDuplicates = (arry) => {
            arry = Array.from(arry);
            return arry.filter((item, index) => arry.indexOf(item) !== index);
        }
        const sliderstepwidth = (slider)=>(slider.querySelector('.doubleslider-background').getBoundingClientRect().width-(slider.querySelector('.doubleslider-handle').getBoundingClientRect().width))/(slider.getAttribute('data-steps')-1);

        function sliderHandleDragStartHandler(event){
            elem = event.target;
            e = event || window.event;
            var pageX = e.pageX;
            draggo = elem.getBoundingClientRect().left-pageX;
        }
        function validateDoublesliderMarkup(slider){
            let toRet = true;
            let steps= slider.getAttribute('data-steps');

            //check consistency of option count and steps-attribute
            if(slider.hasAttribute('data-steps')&&slider.querySelector('datalist')&&(slider.querySelector('datalist').querySelectorAll('option').length != steps))
            {
                toRet = false;
            }
            //check for duplicates in option values
            if(slider.querySelector('datalist')){
                console.log(toFindDuplicates(Array.from(slider.querySelector('datalist').querySelectorAll('option')).map((el)=>el.getAttribute('value'))));
            }
            if(slider.querySelector('datalist')&&toFindDuplicates(Array.from(slider.querySelector('datalist').querySelectorAll('option')).map((el)=>el.getAttribute('value'))).length!=0)
            {
                toRet = false;
            }
            return toRet;
        }
        function redrawSlider(slider){
            let legend = slider.closest('.doubleslider-bounds').querySelector('.doubleslider-legend');
            let legendWidth = legend.getBoundingClientRect().width
            let backgroundWidth = slider.querySelector('.doubleslider-background').getBoundingClientRect().width;
            let handleWidth = slider.querySelector('.doubleslider-handle').getBoundingClientRect().width;
            let steps = slider.getAttribute('data-steps');
            let legendItemWidth = (legendWidth-backgroundWidth+handleWidth);
            let gap = ((backgroundWidth-(steps-1)*legendItemWidth))/(steps-1);
            
            legend.style["grid-column-gap"] = gap+"px"; 

            updateHandlePosition(slider.querySelector('.low'),slider.getAttribute('data-lower'));
            updateHandlePosition(slider.querySelector('.high'),slider.getAttribute('data-upper'));
        }
        function updateHandlePosition(elem,pos){
            let slider = elem.closest('.doubleslider');
            let steps = slider.getAttribute('data-steps');
            let val = pos*sliderstepwidth(slider);
            elem.style.left = val;
            if(elem.classList.contains('low')){
                slider.setAttribute('data-lower',pos);
                slider.querySelector('.doubleslider-hidden-input.lower').value = pos;
            }else{
                slider.setAttribute('data-upper',pos);
                slider.querySelector('.doubleslider-hidden-input.higher').value = pos;
            }
            var lower = slider.querySelector('.low');
            var upper = slider.querySelector('.high');
            slider.querySelector('.doubleslider-foreground').style.left = lower.style.left;
            slider.querySelector('.doubleslider-foreground').style.width = upper.getBoundingClientRect().right-lower.getBoundingClientRect().left-5;
        }
        function sliderHandleDragHandler(event){
            elem = event.target;
            e = event || window.event;

            var pageX = e.pageX;

            // IE 8
            if (pageX === undefined) {
                pageX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            }
            // document.getElementById('alert').textContent = bookings[event_id].duration;
            let steps = elem.closest('.doubleslider').getAttribute('data-steps');
            
            if (pageX != 0) {
                // elem.style.left = 
                let parent = elem.parentElement;
                let pos = range(steps).sort((a,b)=>(Math.abs((((parent.getBoundingClientRect().width-elem.getBoundingClientRect().width)/(steps-1))*a)-(pageX+draggo-parent.getBoundingClientRect().left)))-(Math.abs((((parent.getBoundingClientRect().width-elem.getBoundingClientRect().width)/(steps-1))*b)-(pageX+draggo-parent.getBoundingClientRect().left))))[0];
                if((elem.classList.contains('low') && pos < parent.getAttribute('data-upper')) || (elem.classList.contains('high') && pos >parent.getAttribute('data-lower'))){
                    updateHandlePosition(elem, pos);
                }
                // document.getElementById('debug').textContent = pageX;
            }
        }


        window.addEventListener('load',()=>{
            //construct double-slider
            document.querySelectorAll('.doubleslider').forEach(
                (slider)=>{
                    let bg = document.createElement('div');
                    bg.classList.add("doubleslider-background");
                    let hl = document.createElement('div');
                    hl.classList.add("doubleslider-handle");
                    hl.classList.add("low");
                    let fg = document.createElement('div');
                    fg.classList.add("doubleslider-foreground");
                    let hu = document.createElement('div');
                    hu.classList.add("doubleslider-handle");
                    hu.classList.add("high");
                    
                    let sliderlow = document.createElement('input');
                    sliderlow.classList.add("doubleslider-hidden-input");
                    sliderlow.classList.add("lower");
                    sliderlow.setAttribute('name',slider.getAttribute('data-name')+"_lower")
                    sliderlow.setAttribute('type',"range")
                    let sliderhigh = document.createElement('input');
                    sliderhigh.classList.add("doubleslider-hidden-input");
                    sliderhigh.classList.add("higher");
                    sliderhigh.setAttribute('name',slider.getAttribute('data-name')+"_higher")
                    sliderhigh.setAttribute('type',"range")

                    slider.appendChild(bg);
                    slider.appendChild(hl);
                    slider.appendChild(fg);
                    slider.appendChild(hu);
                    slider.appendChild(sliderlow);
                    slider.appendChild(sliderhigh);
                    
                });
            //connect drag-listeners to slider handles
            document.querySelectorAll('.doubleslider-handle').forEach((el)=>{
                el.addEventListener('dragstart',sliderHandleDragStartHandler);
                el.addEventListener('drag',sliderHandleDragHandler);
            });
            //validate slider & legend markup and construct legend
            document.querySelectorAll('.doubleslider').forEach(
                (slider)=>{
                    if(validateDoublesliderMarkup(slider)){
                        let steps = slider.getAttribute('data-steps');
                        
                        let bounds =  document.createElement('div');
                        bounds.classList.add('doubleslider-bounds');
                        slider.parentElement.appendChild(bounds);

                        let container =  document.createElement('div');
                        container.classList.add('doubleslider-container');
                        bounds.appendChild(container);
                        container.appendChild(slider);
                        
                        let legend =  document.createElement('div');
                        legend.classList.add('doubleslider-legend');
                        bounds.insertBefore(legend,container);
                        if(slider.querySelector('datalist')){
                            slider.querySelector('datalist').querySelectorAll('option').forEach((option)=>{
                                let legendItem = document.createElement('div');
                                legendItem.classList.add('doubleslider-legend-item')
                                legendItem.textContent = option.textContent;
                                legend.appendChild(legendItem);
                            });
                            slider.querySelector('datalist').querySelectorAll('option').forEach((option)=>{
                                let legendItem = document.createElement('div');
                                legendItem.classList.add('doubleslider-legend-item')
                                legendItem.textContent = "|";
                                legend.appendChild(legendItem);
                            });

                        }
                        legend.style["grid-template-columns"]=`repeat(${steps}, minmax(0, 1fr))`;

                        updateHandlePosition(slider.querySelector('.low'),slider.getAttribute('data-lower'));
                        updateHandlePosition(slider.querySelector('.high'),slider.getAttribute('data-upper'));
                        redrawSlider(slider);
                    }
                    else{
                        let errmsg = document.createElement('div');
                        errmsg.classList.add('errmsg');
                        errmsg.textContent = "There are errors in the Markup of this double slider. Refer to the documentation."
                        slider.parentElement.insertBefore(errmsg,slider);
                        slider.remove();
                    }
                }
            )
        });
        //connect resize handler to window to handle resizing
        window.addEventListener('resize',()=>{
            document.querySelectorAll('.doubleslider').forEach((slider)=>{
                redrawSlider(slider);
            });
        });
