tinymce.init({
    selector: "div.description",
    inline: true,
    plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table contextmenu paste spellchecker responsivefilemanager"
    ],
    language: 'ru',
    toolbar_items_size: 'small',
    spellchecker_language: "ru",
    spellchecker_rpc_url: "http://speller.yandex.net/services/tinyspell",
    toolbar: "undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | save_button | highlightcode | spellchecker",
    image_advtab: true,
    external_filemanager_path: "/templates/documentation/js/tinymce/plugins/responsivefilemanager/",
    filemanager_title: "Responsive Filemanager",
    external_plugins: {"filemanager": "/templates/documentation/js/tinymce/plugins/responsivefilemanager/plugin.min.js"},
    setup: function(editor) {
        editor.addButton('save_button', {
            text: 'Сохранить',
            icon: 'save',
            onclick: function() {
                $.ajax({
                    type: 'post',
                    data: 'desc=' + tinyMCE.activeEditor.getContent(),
                    dataType: "json",
                    url: '/documentation/save_desc',
                    success: function(obj) {
                    }
                });
            }
        });
        editor.addButton('highlightcode', {
            text: 'Код',
            icon: 'code',
            onclick: function() {
                var text = editor.selection.getContent({'format': 'text'});
                if (text && text.length > 0) {
                    editor.execCommand('mceInsertContent', false, '<pre><code class="php">' + text + '</code></pre><p>');
                }
            }
        });
    }
});

tinymce.init({
    selector: "h1",
    inline: true,
    toolbar_items_size: 'small',
    toolbar: "undo redo | save_button | spellchecker",
    plugins: ["spellchecker"],
    spellchecker_language: "ru",
    spellchecker_rpc_url: "http://speller.yandex.net/services/tinyspell",
    menubar: false,
    setup: function(editor) {
        editor.addButton('save_button', {
            text: 'Сохранить',
            icon: 'save',
            onclick: function() {
                $.ajax({
                    type: 'post',
                    data: 'h1=' + tinyMCE.activeEditor.getContent(),
                    dataType: "json",
                    url: '/documentation/save_title',
                    success: function(obj) {
                    }
                });
            }
        });
    }
});

tinymce.init({
    selector: ".TinyMCEForm",
    plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table contextmenu paste spellchecker responsivefilemanager"
    ],
    language: 'ru',
    spellchecker_language: "ru",
    spellchecker_rpc_url: "http://speller.yandex.net/services/tinyspell",
    toolbar: "undo redo | styleselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | highlightcode | spellchecker",
    image_advtab: true,
    toolbar_items_size: 'small',
    external_filemanager_path: "/templates/documentation/js/tinymce/plugins/responsivefilemanager/",
    filemanager_title: "Responsive Filemanager",
    external_plugins: {"filemanager": "/templates/documentation/js/tinymce/plugins/responsivefilemanager/plugin.min.js"},
    setup: function(editor) {
        editor.addButton('highlightcode', {
            text: 'Код',
            icon: 'code',
            onclick: function() {
                var text = editor.selection.getContent({'format': 'text'});
                if (text && text.length > 0) {
                    editor.execCommand('mceInsertContent', false, '<pre><code class="php">' + text + '</code></pre>\n');
                }
            }
        });
    }
});