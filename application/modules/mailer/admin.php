<?php

if (!defined('BASEPATH'))
    exit('No direct script access allowed');

/**
 * Image CMS
 *
 * Mailer Admin
 */
class Admin extends BaseAdminController {

    public function __construct() {
        parent::__construct();

        $this->load->library('DX_Auth');
        //cp_check_perm('module_admin');
    }

    public function index() {
        // Get all user groups
        $roles = $this->db->get('shop_rbac_roles')->result_array();
        $this->template->assign('roles', $roles);

        // Get admin email
        $this->db->select('email');
        $this->db->where('id', $this->dx_auth->get_user_id());
        $query = $this->db->get('users', 1)->row_array();
        $this->template->assign('admin_mail', $query['email']);

        // Get site name
        $this->template->assign('site_settings', $this->cms_base->get_settings());


        $query = $this->db->get('mail');
        $row = $query->result_array();
        $this->template->assign('all', $row);


        if (!$this->ajaxRequest)
            $this->display_tpl('form');
    }

    public function send_email() {

        // Load form validation class
        $this->load->library('form_validation');

        $this->form_validation->set_rules('subject', lang('amt_theme'), 'required|trim');
        $this->form_validation->set_rules('name', lang('amt_your_name'), 'required|trim');
        $this->form_validation->set_rules('email', lang('amt_your_email'), 'required|trim|valid_email');
        $this->form_validation->set_rules('message', lang('amt_message'), 'required|trim');

        if ($this->form_validation->run($this) == FALSE) {
            showMessage(validation_errors(), false, 'r');
        } else {
            $this->load->helper('typography');
            $this->load->library('email');

            // Init email config
            $config['wordwrap'] = TRUE;
            $config['charset'] = 'UTF-8';
            $config['mailtype'] = $_POST['mailtype'];
            $this->email->initialize($config);

            // Get users array
            $users = $this->db->get('mail');

            if ($users->num_rows() > 0) {
                $message = $_POST['message'];

                if ($_POST['mailtype'] == 'html') {
                    $message = "<html><body>" . nl2br_except_pre($message) . "</body></html>";
                }
                $counter = array('true' => 0, 'all' => 0);
                foreach ($users->result_array() as $user) {
                    // Replace {username}
                    $tmp_msg = str_replace('%username%', $user['username'], $message);

                    $this->email->from($_POST['email'], $_POST['name']);
                    $this->email->to($user['email']);
                    $this->email->reply_to($_POST['email'], $_POST['name']);
                    $this->email->subject($_POST['subject']);
                    $this->email->message($tmp_msg);
                    $counter['all']++;
                    if ($this->email->send()) {
                        $counter['true']++;
                    }
                }

                $this->load->library('lib_admin');
                $this->lib_admin->log(lang('amt_send') . '(' . $counter['true'] . '/' . $counter['all'] . ')' . lang("amt_users_email_topic") . ')' . $_POST['subject']);
                $class = '';
                if ($counter['true'] == $counter['all']) {
                    $class = '';
                } else if ($counter['true'] == 0) {
                    $class = 'r';
                }
                if ($class !== 'r') {
                    showMessage(lang('amt_message_send') . ': ' . $counter['true'] . lang('amt_count_from') . $counter['all'] . 'шт.' . $class);
                } else {
                    showMessage(lang('amt_not_any_message_from') . $counter['all'] . lang('amt_count_not_send'), $class);
                }
            }
        }
    }

    public function deleteUsers() {


        if (!empty($_POST['ids'])) {

            foreach ($_POST['ids'] as $id) {
                $this->db->delete('mail', array('id' => $id));
            }

            showMessage(lang('a_base_mailer_del_1'));
        } else {
            showMessage(lang('a_base_mailer_del_2', '', 'r'));
        }
    }

    /**
     * Display template file
     */
    private function display_tpl($file = '') {
        $file = realpath(dirname(__FILE__)) . '/templates/admin/' . $file;
        $this->template->show('file:' . $file);
    }

    /**
     * Fetch template file
     */
    private function fetch_tpl($file = '') {
        $file = realpath(dirname(__FILE__)) . '/templates/admin/' . $file . '.tpl';
        return $this->template->fetch('file:' . $file);
    }

}

/* End of file admin.php */