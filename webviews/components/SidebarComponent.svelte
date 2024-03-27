<script lang="ts">
    import {onMount} from 'svelte'
    let todos: Array<{text: string, completed: boolean}> = [];
    let text = '';

    onMount(() => {
        window.addEventListener("message", (event) => {
            const msge = event.data;
            switch(msge.type){
                case 'new-todo':
                    todos = [{text: msge.value, completed: false}, ...todos]
                    break;
            }
        })
    })
</script>
<style>
    li.complete {
        text-decoration: line-through;
    }
</style>

<h1>Hello World</h1>

<form on:submit|preventDefault={(()=>{
    todos = [...todos, {text, completed: false}]
    text = '';
})}>
    <input bind:value={text}/>
</form>

<ul>
    {#each todos as todo (todo.text)}
        <li 
            class:complete={todo.completed} 
            on:keyup={()=>{
                todo.completed = !todo.completed;
            }}
            on:click={()=>{
                todo.completed = !todo.completed;
            }}>
            {todo.text}
        </li>
    {/each}
</ul>

