<template>
  <!--for testing purpose-->
  <div>
    <img id="image2" :src= image alt="test" width="180" />
    <button type="button" @click="getImageBlob('ΒΓ (407,291,447,318).png?checksum=2022-05-12T12:30:42Z')">Image</button>
    <button type="button" @click="getNewImage">Image</button>
  </div>
</template>

<script>
  import axios from "axios";

  export default {
    data() {
      return {
        image: "http://thacer.archaiodata.com/ThaCER.svg"
      };
    },
    props: {
    },
    methods: {
      getImageBlob(url) {
        // var url = "ΒΓ (407,291,447,318).png?checksum=2022-05-12T12:30:42Z";
        var session_url = "http://localhost:9000/idig/Agora/2013/attachments/" + url;
        return axios({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "get",
          url: session_url,
          responseType: "blob",
          auth: {
            username: "idig",
            password: "idig",
          },
          data: {
          },
        })
          .then(response => {
            this.image = URL.createObjectURL(response.data)
          })
          .catch((error) => {
            console.log(error);
          });
      },
      getNewImage() {
        axios({
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "get",
          url: "http://localhost:9000/idig/Agora/2013/attachments/ΒΓ (407,291,447,318).png?checksum=2022-05-12T12:30:42Z",
          responseType: "blob",
          auth: {
            username: "idig",
            password: "idig",
          },
          data: {
          },
        })
          .then(response => {
            let imageNode = document.getElementById('image');
            let blob = new Blob(
              [response.data],
              { type: response.headers['content-type'] }
            )
            let imgUrl = URL.createObjectURL(blob)
            imageNode.src = imgUrl
          })
          .catch(error => {
            // eslint-disable-next-line
            alert(error + "something goes wrong! Maybe image url broken, try another img url.")
          })
      }

    },
  };
</script>