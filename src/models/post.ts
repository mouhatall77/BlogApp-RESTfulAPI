class Post
{
    postId:number;
    createdDate:Date;
    title:string;
    content:string;
    userId:string;
    headerImage:string;
    lastUpdated:Date;
    constructor(postId:number, createdDate:Date, title:string, content:string, userId:string, headerImage:string, lastUpdated:Date) 
    {
        this.postId = postId;
        this.createdDate = createdDate;
        this.title = title;
        this.content = content;
        this.userId = userId;
        this.headerImage = headerImage;
        this.lastUpdated = lastUpdated;
    }

}
const postArray:Post[]=[];
export {Post, postArray};