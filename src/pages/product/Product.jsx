import { Link,useLocation } from "react-router-dom";
import "./product.css";
import Chart from "../../components/chart/Chart"
import { Publish } from "@material-ui/icons";
import {useState,useMemo,useEffect} from "react";
import {  userRequest  } from "../../requestMethods";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import app from "../../firebase";
import { updateProduct } from "../../redux/apiCalls";
import { useDispatch } from "react-redux";



export default function Product() {
    const location =useLocation();
    const productId =location.pathname.split("/")[2];
    const [pStats,setPStats]=useState([]);
    // const product=useSelector((state)=>
    //     state.product.products.find((product)=>product._id===productId));
    const [product,setProduct]=useState({});


        useEffect(()=>{
          const getProduct = async ()=>{
            try{
              const res =await userRequest.get("https://apicoshopy.herokuapp.com/api/products/find/"+productId);
              setProduct(res.data);
            }catch(err){}
          };
          getProduct();
        },[productId]);
        const MONTHS = useMemo(
            () => [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Agu",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ],
            []
          );
    useEffect(() => {
    const getStats = async () => {
      try {
        const res = await userRequest.get("orders/income?pid=" + productId);
        const list = res.data.sort((a,b)=>{
            return a._id - b._id
        })
        list.map((item) =>
          setPStats((prev) => [
            ...prev,
            { name: MONTHS[item._id - 1], Sales: item.total },
          ])
        );
      } catch (err) {
        console.log(err);
      }
    };
    getStats();
  }, [productId, MONTHS]);     
  
  
  const [inputs,setInputs] =useState({});
  const [file,setFile] =useState(null);
  const [cat,setCat] =useState(product.categories);
  const [size,setSize] =useState(product.size);
  const [color,setColor] =useState(product.color);

  const dispatch = useDispatch();

  const handleChange =(e)=>{
    setInputs(prev=>{
      return {...prev, [e.target.name]:e.target.value}
    })
  };
  const handleCat =(e)=>{
    setCat(e.target.value.split(","))
  };
  const handleSize =(e)=>{
    setSize(e.target.value.split(","))
  };
  const handleColor =(e)=>{
    setColor(e.target.value.split(","))
  };

  const handleClick =(e)=>{
    e.preventDefault();
    if(file==null){
      const productU= { ...inputs,  categories: cat,color:color,size:size };
      updateProduct(productId,productU,dispatch);
    }else
    {
      const fileName=new Date().getTime()+file.name;
    const storage=getStorage(app);
    const storageRef=ref(storage,fileName);
        // Upload the file and metadata
    const uploadTask = uploadBytesResumable(storageRef, file);
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
        }
      }, 
      (error) => {
        // Handle unsuccessful uploads
      }, 
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          const productU= { ...inputs,img: downloadURL, categories: cat,color:color,size:size };
          updateProduct(productId,productU,dispatch);
        });
      }
    );
    }

   
  };
  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Product</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
          <div className="productTopLeft">
              <Chart data={pStats} dataKey="Sales" title="Sales Performance"/>
          </div>
          <div className="productTopRight">
              <div className="productInfoTop">
                  <img src={product.img} alt="" className="productInfoImg" />
                  <span className="productName">{product.title}</span>
              </div>
              <div className="productInfoBottom">
                  <div className="productInfoItem">
                      <span className="productInfoKey">id:</span>
                      <span className="productInfoValue">{product._id}</span>
                  </div>
                  <div className="productInfoItem">
                      <span className="productInfoKey">sales:</span>
                      <span className="productInfoValue">${product.price}</span>
                  </div>
                  
                  <div className="productInfoItem">
                      <span className="productInfoKey">in stock:</span>
                      <span className="productInfoValue">{product.inStock}</span>
                  </div>
              </div>
          </div>
      </div>
      <div className="productBottom">
          <form className="productForm">
              <div className="productFormLeft">
                  <label>Product Name</label>
                  <input name="title" type="text" defaultValue={product.title} onChange={handleChange}/>
                  <label>Product Description</label>
                  <input name="desc" type="text" defaultValue={product.desc} onChange={handleChange}/>
                  <label>Product Price</label>
                  <input name="price" type="number" defaultValue={product.price} onChange={handleChange}/>
                  <label>Product Categories</label>
                  <input  type="text" defaultValue={product.categories} onChange={handleCat} />
                  <label>Product Color</label>
                  <input  type="text" defaultValue={product.color}  onChange={handleColor}/>
                  <label>Product Size</label>
                  <input  type="text" defaultValue={product.size} onChange={handleSize}/>
                  <label>In Stock</label>
                  <select name="inStock" id="idStock">
                      <option defaultValue="true">Yes</option>
                      <option defaultValue="false">No</option>
                  </select>
              </div>
              <div className="productFormRight">
                  <div className="productUpload">
                      <img src={product.img} alt="" className="productUploadImg" />
                      <label for="file">
                          <Publish/>
                      </label>
                      <input type="file"
                            id="file"
                            onChange={(e) => setFile(e.target.files[0])} 
                            style={{display:"none"}}
                     />
                  </div>
                  <button onClick={handleClick}  className="productButton">Update</button>
              </div>
          </form>
      </div>
    </div>
  );
}
