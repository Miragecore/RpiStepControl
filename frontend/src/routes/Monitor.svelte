<script>
    //import {writable} from "svelte/store"
    import StatusButton from './StatusButton.svelte';

    //const socket = new WebSocket('ws://7304-2001-2d8-e135-f0d6-dcff-1cb0-80ad-623a.ngrok.io');
    const socket = new WebSocket('ws://localhost:8000/ws');
    //const socket = new WebSocket('ws://f62f-61-32-22-132.jp.ngrok.io:8000/ws');
    let recv = {};

    socket.addEventListener('open', function(event) {
        console.log("It's Open");
    });

    socket.addEventListener('message', function(event) {
        //console.log(event.data)
        recv = JSON.parse(event.data);
        //const d2 = JSON.parse(data);
        //console.log(data);
        //recv = data;
        //console.log(recv);
    });
    
</script>
<br>
<table>
    <th>번 호</th>
    <th>장 비 명</th>
    <th>상 태</th>
    <th>I P</th>
    {#each Object.entries(recv) as [ID, paragraph]}
    <tr>
            <td>{ID}</td>
            <td>{paragraph['name']}</td>
            <td><StatusButton status={paragraph['status']}/></td>
            <td>{paragraph['IP']}</td>
    </tr>
    {/each}
</table>

<style>
    td {
        border-bottom: 1px solid #ddd;
        height: 40px;
    }

    tr:hover {
        background-color: coral;
    }

    tr {
        height: 30px;
        vertical-align: center;
        text-align: center;
    }

    th {
        background-color: #04AA6D;
        color: white;
        vertical-align: center;
        height: 30px;
        border-bottom: 1px solid #ddd;
        font-size: 24px;
    }

    table {
        width: 80%;
    }
</style>

