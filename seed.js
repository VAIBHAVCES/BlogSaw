const mongooose = require('mongoose');
const {Blogs}= require('./models/blogs.js');


function seed(){
    const data = [

        {
            heading:"FAANG: 3 interviews and 3 offers",
            sub_heading:"Set Up Interviews",
            icon:"https://miro.medium.com/fit/c/160/107/1*eTb4COzvrIpceQwCqzMqYQ.jpeg",
            body_text:`The majority of engineers regularly get messages/emails from tech recruiters from different companies. Especially if you have N years of experience (I don’t know exact filters that recruiters use but suppose something like N ≥ 5) and a proven track record of growth. And I’m not an exception at all and usually get 2–3 emails/messages per week.
            Unfortunately, a lot of such messages are irrelevant. They either propose relocating to some inconvenient location, joining a questionable startup, or using some old instruments/tech stack, or getting too low pay. And because of that, many people, including me, started ignoring most of these proposals not to waste their time. [any idea how to fix it, recruiters?]
            To my surprise, around three months ago, I got such an email from one of FAANG companies. It was interesting as to that time I started thinking about joining some big company as all my current experience was limited to startups (the current company is slightly bigger than 1K people with ~200 engineers in it), and I wanted to know how it feels like working in a tech giant.
            I heard that it’s not easy even to have interviews in such companies, and you need some referrals; otherwise, you will be dumped even before the process will start. And I decided that it’s a good signal to start doing something in that direction as I already have a chance at least have an interview in one big company.
            I started analyzing the market and select some companies I’d like to join. At the same time, I didn’t want to let too many people know that I started looking around as I was afraid that it could negatively affect my current work. So, I decided to limit the number of companies to 5 — Amazon, Facebook, Google, Netflix, and Uber.`,
            body_img:"https://miro.medium.com/max/1920/1*ys6jeZfUZH4gX3vP6DCgcQ.png",
            author:"Boris Johnson"
    
        }
        
    ];
    console.log("seed is called");    
    Blogs.insertMany(data);
}
module.exports.seed = seed; 