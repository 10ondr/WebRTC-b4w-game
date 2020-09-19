import b4w from "blend4web";

m_anim      = b4w.animation;
m_app       = b4w.app;
m_cfg       = b4w.config;
m_cont      = b4w.container;
m_ctl       = b4w.controls;
m_data      = b4w.data;
m_fps       = b4w.fps;
m_input     = b4w.input;
m_main      = b4w.main;
m_preloader = b4w.preloader;
m_scs       = b4w.scenes;
m_sfx       = b4w.sfx;
m_version   = b4w.version;

m_tran    = b4w.transform;
m_cam     = b4w.camera;
m_vec3    = b4w.vec3;
m_math    = b4w.math;
m_phy     = b4w.physics;
m_util    = b4w.util;
m_tsr     = b4w.tsr;
m_rgba    = b4w.rgba;
m_mat     = b4w.material;
m_obj     = b4w.objects;

var DEBUG = (m_version.type() === "DEBUG");
var FPS_GAME_CAM_SMOOTH_FACTOR = 0.01;
var FPS_GAME_SENSITIVITY = 110;

var LEFT_MOUSE_BUTTON_ID = 1;
var RIGHT_MOUSE_BUTTON_ID = 3;

// Our player's camera
cam = null;
// Peer player object
peer = null;
// True if peer was hit
peer_hit = false;

// Score objects in the scene
number_objects = null;
pl1_num_positions = null;
pl2_num_positions = null;

export function init() {
    var show_fps = DEBUG;

    var url_params = m_app.get_url_params();

    if (url_params && "show_fps" in url_params)
        show_fps = true;

    m_app.init({
        canvas_container_id: "canvas3d",
        callback: init_cb,
        show_fps: show_fps,
        assets_dds_available: !DEBUG,
        assets_min50_available: !DEBUG,
        alpha: false,
        stereo: get_hmd_type()
    });
}

function init_score(){
    // Get reference to number objects (0-9) 
    number_objects = [
        m_scs.get_object_by_name("num_0"),
        m_scs.get_object_by_name("num_1"),
        m_scs.get_object_by_name("num_2"),
        m_scs.get_object_by_name("num_3"),
        m_scs.get_object_by_name("num_4"),
        m_scs.get_object_by_name("num_5"),
        m_scs.get_object_by_name("num_6"),
        m_scs.get_object_by_name("num_7"),
        m_scs.get_object_by_name("num_8"),
        m_scs.get_object_by_name("num_9")
    ]

    // Reference to the score number positions for Player 1
    pl1_num_positions = [
        m_scs.get_object_by_name("pl1_pos1"),
        m_scs.get_object_by_name("pl1_pos2")
    ]

    // Reference to the score number positions for Player 2
    pl2_num_positions = [
        m_scs.get_object_by_name("pl2_pos1"),
        m_scs.get_object_by_name("pl2_pos2")
    ]
}

function get_hmd_type() {
    if (m_input.can_use_device(m_input.DEVICE_HMD) && !m_main.detect_mobile())
        return "HMD";
    return "NONE";
}

function init_cb(canvas_elem, success) {
    if (!success) {
        console.log("b4w init failure");
        return;
    }

    scene_canvas = canvas_elem;

    m_preloader.create_preloader();

    window.addEventListener("resize", resize);

    load();
}

function preloader_cb(percentage) {
    m_preloader.update_preloader(percentage);
}

function load() {
    var load_path = m_cfg.get_std_assets_path() +
            "tutorials/firstperson/firstperson.json";
    m_data.load(load_path, load_cb, preloader_cb);
}

function load_cb(data_id) {
    // make camera follow the character
    m_fps.enable_fps_controls();
    m_fps.set_cam_smooth_factor(FPS_GAME_CAM_SMOOTH_FACTOR);
    m_fps.set_cam_sensitivity(FPS_GAME_SENSITIVITY);
    prepare_anim();
    var container = m_cont.get_container();
    enable_shot_interaction(container);

    init_score();
}

function resize() {
    m_cont.resize_to_container();
}

function prepare_anim() {
    var gun = m_scs.get_object_by_dupli_name("gun", "lp.005");
    var emitter_1 = m_scs.get_object_by_dupli_name("gun", "Plane");
    var emitter_2 = m_scs.get_object_by_dupli_name("gun", "Plane.001");
    var emitter_3 = m_scs.get_object_by_dupli_name("gun", "Plane.002");
    var emitter_4 = m_scs.get_object_by_dupli_name("gun", "Plane.003");
    m_anim.apply(gun, "zoom_shoot", m_anim.SLOT_2);
    m_anim.set_behavior(gun, m_anim.AB_FINISH_RESET, m_anim.SLOT_2);
    m_anim.apply(gun, "shoot", m_anim.SLOT_0);
    m_anim.set_behavior(gun, m_anim.AB_FINISH_RESET, m_anim.SLOT_0);
    m_anim.apply(gun, "zoom", m_anim.SLOT_1);
    m_anim.set_behavior(gun, m_anim.AB_FINISH_STOP, m_anim.SLOT_1);

    m_anim.apply(emitter_1, "ParticleSystem", m_anim.SLOT_0);
    m_anim.set_behavior(emitter_1, m_anim.AB_FINISH_RESET, m_anim.SLOT_0);
    m_anim.apply(emitter_2, "ParticleSystem", m_anim.SLOT_0);
    m_anim.set_behavior(emitter_2, m_anim.AB_FINISH_RESET, m_anim.SLOT_0);
    m_anim.apply(emitter_3, "ParticleSystem", m_anim.SLOT_0);
    m_anim.set_behavior(emitter_3, m_anim.AB_FINISH_RESET, m_anim.SLOT_0);
    m_anim.apply(emitter_4, "ParticleSystem", m_anim.SLOT_0);
    m_anim.set_behavior(emitter_4, m_anim.AB_FINISH_RESET, m_anim.SLOT_0);
}

function start_shoot_smoke(em1, em2, em3, em4, speaker) {
    m_anim.play(em1, null, m_anim.SLOT_0);
    m_anim.play(em2, null, m_anim.SLOT_0);
    m_anim.play(em3, null, m_anim.SLOT_0);
    m_anim.play(em4, null, m_anim.SLOT_0);
}

function start_shoot_sound(speaker) {
     m_sfx.play(speaker);
}

function seet_zoom_speed(obj, is_zoom_mode, slot_num) {
    if (is_zoom_mode)
        m_anim.set_speed(obj, -1, slot_num);
    else
        m_anim.set_speed(obj, 1, slot_num);
}

function start_shoot_anim(obj, is_zoom_mode, anim_cb, slot_num, zoom_slot_num) {
    if (is_zoom_mode)
        m_anim.play(obj, anim_cb, zoom_slot_num);
    else
        m_anim.play(obj, anim_cb, slot_num);
}

function enable_shot_interaction(html_elemet) {
    var shot_speaker = m_scs.get_object_by_name("shot");
    var gun = m_scs.get_object_by_dupli_name("gun", "lp.005");
    var disable_interaction = false;
    var is_zoom_mode = false;
    var mouse_press_sensor = m_ctl.create_mouse_click_sensor(html_elemet);
    var emitter_1 = m_scs.get_object_by_dupli_name("gun", "Plane");
    var emitter_2 = m_scs.get_object_by_dupli_name("gun", "Plane.001");
    var emitter_3 = m_scs.get_object_by_dupli_name("gun", "Plane.002");
    var emitter_4 = m_scs.get_object_by_dupli_name("gun", "Plane.003");
    var logic_func = function(s) {
        return s[0];
    }
    var anim_cb = function(obj, slot_num) {
        disable_interaction = false;
    }

    
    var pline = m_math.create_pline();
    var from = new Float32Array(3);
    var to = new Float32Array(3);
    cam = m_scs.get_object_by_name("Camera");
    peer = m_scs.get_object_by_name("Peer");

    var ray_test_cb = function(id, hit_fract, obj_hit, hit_time, hit_pos, hit_norm) {
        if(obj_hit){
            if(obj_hit.name == "Peer"){
                peer_hit = true;
            }
        }
    }

    var create_raycast = function(e) {
        var x = (scene_canvas.width / 2) + (scene_canvas.width * 0.03012048);
        var y = (scene_canvas.height / 2) + (scene_canvas.height * 0.01447776);
        
        // NOTE: Fix for error caused by incompatible camera
        // error message "calc_ray(): Non-compatible camera"
        // Add "case: 90" at the beginning of the switch causing the error (in the compiled minified javascript file. Search for the above error message)
        m_cam.calc_ray(cam, x, y, pline);
        m_math.get_pline_directional_vec(pline, to);

        m_vec3.scale(to, 100, to);
        var id = m_phy.append_ray_test_ext(cam, from, to, "ANY",
                ray_test_cb, true, false, true, true);
    }

    var manifold_cb = function(obj, id, pulse) {
        if (pulse && !disable_interaction) {
            var payload = m_ctl.get_sensor_payload(obj, id, 0);
            switch(payload.which) {
            case LEFT_MOUSE_BUTTON_ID:
                disable_interaction = true;
                start_shoot_smoke(emitter_1, emitter_2, emitter_3, emitter_4);
                start_shoot_sound(shot_speaker);
                start_shoot_anim(obj, is_zoom_mode, anim_cb, m_anim.SLOT_0, m_anim.SLOT_2);
                create_raycast();
                break;
            case RIGHT_MOUSE_BUTTON_ID:
                disable_interaction = true;
                seet_zoom_speed(obj, is_zoom_mode, m_anim.SLOT_1);
                m_anim.play(obj, anim_cb, m_anim.SLOT_1);
                is_zoom_mode = !is_zoom_mode;
                break;
            }
        }
    }
    m_ctl.create_sensor_manifold(gun, "SHOT_MANIFOLD", m_ctl.CT_SHOT,
            [mouse_press_sensor], logic_func, manifold_cb);
}

m_init = init;