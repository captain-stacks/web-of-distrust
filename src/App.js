import logo from './logo.svg';
import './App.css';
import {
  SimplePool,
  nip19,
  relayInit
} from 'nostr-tools'
import { useEffect, useState } from 'react';

const pool = new SimplePool()
window.pool = pool
window.nip19 = nip19



function App() {

  const [publicKey, setPublicKey] = useState()
  const [chat, setChat] = useState([])
  const [relays, setRelays] = useState([
    'wss://relay.nostr.band',
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://nostr.bitcoiner.social/',
    'wss://nostr21.com/',
    'wss://relay.nostrify.io/',
    'wss://nostr-pub.wellorder.net',
    'wss://offchain.pub',
    'wss://relay.current.fyi',
    'wss://nostr.shroomslab.net',
    'wss://relayable.org',
    'wss://nostr.thank.eu',
  ].map(r => [r, {read: true, write: true}]))


  function getReadRelays() {
    return relays.filter(r => r[1].read).map(r => r[0])
  }

  function getWriteRelays() {
    return relays.filter(r => r[1].write).map(r => r[0])
  }

  window.getWriteRelays = getWriteRelays
  window.getReadRelays = getReadRelays
  
  async function profile() {
    let filter = {
      kinds: [3],
      authors: [publicKey]
    }
    let events = await pool.list(getReadRelays(), [filter])
    events.sort((a, b) => b.created_at - a.created_at)
    let follows = events[0].tags.filter(t => t[0] === 'p').map(t => t[1])
    
    filter = {
      kinds: [0],
      authors: follows
    }
    events = await pool.list(getReadRelays(), [filter])
    let contacts = events.map(e => JSON.parse(e.content))
    setChat(contacts)
    console.log(contacts)
  }

  async function getPublicKey() {
    let publicKey
    try {
      publicKey = await window.nostr.getPublicKey()
    } catch (error) {
      alert(error)
    }
    setPublicKey(publicKey)
    return publicKey
  }

  async function login() {
    let publicKey = await getPublicKey()
    const filter = {
      kinds: [3, 10002],
      authors: [publicKey]
    }
    const readRelays = getReadRelays()
    const events = await pool.list(readRelays, [filter])
    events.sort((a, b) => b.created_at - a.created_at)

    const e = events
      .filter(e => e.kind === 10002 || (e.kind === 3 && e.content))
      .sort((a, b) => b.created_at - a.created_at)[0]
    console.log(e)
    const relays = e.kind === 3
      ? Object.entries(JSON.parse(e.content))
      : e.tags
        .filter(t => t[0] === 'r')
        .map(t => [
          t[1], t[2]
            ? { read: t[2] === 'read', write: t[2] === 'write' }
            : { read: true, write: true }])
    setRelays(relays)

    console.log(getReadRelays())
    console.log(getWriteRelays())
  }

  return (
    <div className="App">
      <header className="App-header">
        {(publicKey && 0) ? '' : <button onClick={login}>Log in</button>}
        <button onClick={profile}>Load profile</button>
        {/* {relays.map(r => <div>{r[0]}</div>)} */}
        {chat.map(c => <div><img src={c.picture} alt="" width={50}/>{' '}{c.displayName || c.name}</div>)}
      </header>
    </div>
  );
}

export default App;