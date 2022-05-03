<script>
    export let params = {}
  </script>
  
  <h1>Movie!</h1>
  <!--
    여기서 id 라는 키값은 :id 값과 동일해야한다.
    index.js에서 :abcd 로 작성하면 {params.abcd} 로 파라미터를 가져와야 한다.
  -->
  <h2>{params.id}</h2>