module stamp_rally::core {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::display;
    use sui::package;
    use std::string::{Self, String};

    // One-Time Witness for package publisher
    public struct CORE has drop {}

    // Event struct representing a stamp rally event
    public struct Event has key, store {
        id: UID,
        name: String,
        slug: String,
        image_url: String,
        description: String,
        start_ms: u64,
        end_ms: u64,
        cap: u64,
        minted: u64,
        admin: address,
    }

    // PassNFT representing participation in an event
    public struct PassNFT has key, store {
        id: UID,
        event_id: ID,
        event_name: String,
        event_slug: String,
        image_url: String,
        minted_at: u64,
        holder: address,
    }

    // Events
    public struct EventCreated has copy, drop {
        event_id: ID,
        slug: String,
        admin: address,
    }

    public struct PassMinted has copy, drop {
        pass_id: ID,
        event_id: ID,
        recipient: address,
    }

    public struct EventUpdated has copy, drop {
        event_id: ID,
        admin: address,
    }

    public struct EventDeleted has copy, drop {
        event_id: ID,
        admin: address,
    }

    // Error codes
    const E_EVENT_NOT_STARTED: u64 = 0;
    const E_EVENT_ENDED: u64 = 1;
    const E_CAP_REACHED: u64 = 2;
    const E_NOT_ADMIN: u64 = 3;

    // Initialize display for PassNFT
    fun init(otw: CORE, ctx: &mut TxContext) {
        let publisher = package::claim(otw, ctx);
        
        let mut display = display::new<PassNFT>(&publisher, ctx);
        display::add(&mut display, string::utf8(b"name"), string::utf8(b"{event_name} - SuiQuest JP Pass"));
        display::add(&mut display, string::utf8(b"description"), string::utf8(b"Commemorative NFT Pass for attending {event_name} at SuiQuest JP"));
        display::add(&mut display, string::utf8(b"image_url"), string::utf8(b"{image_url}"));
        display::add(&mut display, string::utf8(b"project_url"), string::utf8(b"https://suiquest.jp"));
        display::add(&mut display, string::utf8(b"creator"), string::utf8(b"SuiQuest JP"));
        
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    // Create a new stamp rally event
    public entry fun create_event(
        name: vector<u8>,
        slug: vector<u8>,
        image_url: vector<u8>,
        description: vector<u8>,
        start_ms: u64,
        end_ms: u64,
        cap: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let event = Event {
            id: object::new(ctx),
            name: string::utf8(name),
            slug: string::utf8(slug),
            image_url: string::utf8(image_url),
            description: string::utf8(description),
            start_ms,
            end_ms,
            cap,
            minted: 0,
            admin: sender,
        };

        let event_id = object::id(&event);
        
        event::emit(EventCreated {
            event_id,
            slug: string::utf8(slug),
            admin: sender,
        });

        transfer::public_share_object(event);
    }

    // Mint a pass NFT for an event
    public entry fun mint_pass(
        event: &mut Event,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let current_time = clock::timestamp_ms(clock);
        let sender = tx_context::sender(ctx);
        
        // Check mint conditions
        assert!(current_time >= event.start_ms, E_EVENT_NOT_STARTED);
        assert!(current_time <= event.end_ms, E_EVENT_ENDED);
        assert!(event.minted < event.cap, E_CAP_REACHED);

        let pass = PassNFT {
            id: object::new(ctx),
            event_id: object::id(event),
            event_name: event.name,
            event_slug: event.slug,
            image_url: event.image_url,
            minted_at: current_time,
            holder: sender,
        };

        let pass_id = object::id(&pass);
        event.minted = event.minted + 1;

        event::emit(PassMinted {
            pass_id,
            event_id: object::id(event),
            recipient: sender,
        });

        transfer::public_transfer(pass, sender);
    }

    // Update event details (admin only)
    public entry fun update_event_details(
        event: &mut Event,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == event.admin, E_NOT_ADMIN);
        
        event.name = string::utf8(name);
        event.description = string::utf8(description);
        event.image_url = string::utf8(image_url);

        event::emit(EventUpdated {
            event_id: object::id(event),
            admin: tx_context::sender(ctx),
        });
    }


    // Get event information
    public fun get_event_info(event: &Event): (String, String, String, u64, u64, u64, u64) {
        (
            event.name,
            event.slug,
            event.description,
            event.start_ms,
            event.end_ms,
            event.cap,
            event.minted
        )
    }
}