***************
Getting Started
***************

Things You Need
===============

- :std:doc:`Nengo <nengo:getting-started>`
- A :ref:`supported FPGA board <supported-hardware>`
- A NengoFPGA Licence (available from `Applied Brain Research
  <https://store.appliedbrainresearch.com/collections/nengo-fpga>`_)
- (Optional) `NengoGUI <https://github.com/nengo/nengo-gui>`_

.. _quick-guide:

Installation Quick Reference Guide
==================================

.. Do we have a troubleshooting piece here in case something doesn't work?

.. rst-class:: compact

First, get the your board NengoFPGA ready using the
:ref:`device-specific board setup documentation <board-setup>`.
Once your board is set up, do the following steps on the PC connected to the board:

1. :ref:`Install NengoFPGA <software-install>`.
#. :ref:`Edit the NengoFPGA config file <nengofpga-config>` to match your setup.
#. Test NengoFPGA by running the ID extractor script:

   i. In a terminal on your computer navigate to the root ``nengo-fpga``
      directory.
   #. Run the ID extractor script with:

      .. code-block:: bash

         python nengo_fpga/id_extractor.py <board>

      where **<board>** is the board name as it appears in ``fpga_config``.
      See the `Copy Protection`_ section for more information.

#. Now with the Device ID available, you are ready to
   :ref:`acquire your bitstreams <get-bitstreams>`.
#. Once the bitstreams and supporting files have been delivered, copy these
   files to the appropriate location as outlined in the
   :ref:`device-specific bitstream documentation <update-bitstreams>`.
#. Test NengoFPGA by running an example script:

   i. Navigate to ``nengo-fpga/docs/examples``.
   #. Run the basic example script:

      .. code-block:: bash

         python basic_example.py <board>

      where **<board>** is the board name as it appears in ``fpga_config``.

   #. If the script has a successful run you will see a lot of **[INFO]**
      printed to the console indicating the status of the NengoFPGA system.
      Near the bottom you will see the RMSE of the network printed:

      .. code-block:: none

         Computed RMSE: 0.00105

      You may get a slightly different value but if your NengoFPGA system
      is functioning correctly, this should be near 0.001.

   .. note::
      If you run the ``basic_example.py`` script and it hangs waiting for the
      simulation to begin but does not display any errors, then it is likely
      a firewall issue. Ensure your firewall allows connections to and from
      the board IP address.



.. _software-install:

NengoFPGA Software Installation
===============================

Download the NengoFPGA source code from github using git:

.. code-block:: bash

   git clone https://github.com/nengo/nengo-fpga.git

or navigate to the `repository <https://github.com/nengo/nengo-fpga>`_ and
download the files manually. Once downloaded, navigate to the ``nengo-fpga``
folder in a terminal window and install with:

.. code-block:: bash

   pip install -e .

.. _board-setup:

FPGA Board Setup
================

Follow documentation for your particular FPGA device:

- :std:doc:`Board setup for Terasic DE1-SoC <nengo-de1:getting-started>`
  (Intel Cyclone V)
- :std:doc:`Board setup for Digilent PYNQ <nengo-pynq:getting-started>`
  (Xilinx Zynq)

The full list of hardware that NengoFPGA supports, and the links to their
respective documentation can be found :ref:`here <supported-hardware>`.

.. _nengofpga-config:

NengoFPGA Software Configuration
================================

NengoFPGA is the frontend that connects to one of many backend FPGA devices. You
will need to have a :ref:`supported FPGA board <supported-hardware>` with access
to Applied Brain Research's designs. Each FPGA board will have it's own setup
and configuration procedure outlined in it's own documentation, however, the
NengoFPGA frontend has its own configuration as outlined below.

The NengoFPGA default config file, ``fpga_config``, is located in the root
directory of ``nengo-fpga`` and contains example settings for your host machine
as well as the FPGA board you are using. You can also create a copy in the
directory in which your project files are located. Anything in square brackets
(eg. **[host]**) defines a new entry name and everything below that name up
until the name defines parameters of that entry.

Host
----

First we will look at the host configuration; this is information about your
computer and must be called **[host]**:

.. code-block:: none

   [host]
   ip = 10.162.177.10

Make sure these lines are uncommented (remove the leading # *and* space so it
appears as above). This is just an example value for **ip**, you will need to
replace this with your computer's actual IP address, see :ref:`ip-addr` for
instructions on finding your IP address.

.. note::
   Your computer IP address will need to be in the same subnet as the board IP
   address, follow your board specific instructions to get the board IP and
   setup your computer IP before proceeding.

FPGA Board
----------

.. do we want any of this in the board-specific repos?

The entries that define the FPGA board parameters have more values than the
host entry, the name (eg. **[pynq]**) can be anything, though we recommend
using a descriptive name such as **[pynq]** or **[de1]**.

.. caution::
   Every board connected to the same network *must* have its own entry
   in the config file.

.. code-block:: none

   # Example DE1 FPGA board configuration
   [de1]
   ip = 10.162.177.236
   ssh_port = 22
   ssh_user = root
   ssh_pwd =
   # Refer to the online documentation for SSH key configuration options
   remote_script = /opt/nengo-de1/nengo_de1/single_pes_net.py
   id_script = /opt/nengo-de1/nengo_de1/id_script.py
   remote_tmp = /opt/nengo-de1/params
   udp_port = 0

   # Example PYNQ FPGA board configuration
   [pynq]
   ip = 10.162.177.99
   ssh_port = 22
   ssh_user = xilinx
   ssh_pwd = xilinx
   # Refer to the online documentation for SSH key configuration options
   remote_script = /opt/nengo-pynq/nengo_pynq/single_pes_net.py
   id_script = /opt/nengo-pynq/nengo_pynq/id_script.py
   remote_tmp = /opt/nengo-pynq/params
   udp_port = 0

For whichever board you are using, make sure the lines in the appropriate
sections are uncommented (remove the leading # *and* space so it
appears as above). These default values should be correct unless you've
modified the settings or installation of your FPGA board. These parameters are
described here but modifications of these values will be described in the
board-specific documentation.

- **ip**: IP address of the FPGA board.
- **ssh_port**: The port used to open SSH communications between the host
  and FPGA board.
- **ssh_user**: SSH username to use to login to the board.
- **ssh_pwd**: Password for **ssh_user** to use to login to the board. Note
  that the ``fpga_config`` file supports the use of SSH keys
  (see :ref:`ssh-key`) as an alternate form of authentication.
- **remote_script**: The location of the main communication script on the FPGA
  board.
- **id_script**: The location of the script that extracts the unique device
  identifier.
- **remote_tmp**: Temporary location used to store data as it is transferred
  between the host and FPGA board.
- **udp_port**: The port used for UDP communications between the host and FPGA
  board.

.. note::
   It should be noted that the FPGA board should be configured such that
   non-root users do not require a password to perform ``sudo`` commands. If you
   are using the NengoBrainBoard SD image on your board, this should already be
   done. If not, refer to the respective FGPA board documentation for instructions
   on how to do this.

Copy Protection
===============

Our hardware design (known as the bitstream) is locked to a specific device.
Each bitstream is compiled with your unique board identifier (called Device ID)
and therefore you will need to provide this unique ID to us before we
can compile and deliver your tailored bitstream.

.. _device-id:

Reading Device ID
------------------

To easily read your Device ID, first ensure you have setup your board to be
NengoFPGA ready. Instructions on how to do this can be found in each board's
respective documentation (see :ref:`Board Setup <board-setup>`).
Additionally, ensure you have reviewed the
:ref:`NengoFPGA configuration <nengofpga-config>` section,
and appropriately modified the ``fpga_config`` file.

Once done, simply run the ``id_extractor.py`` script located in the
``nengo_fpga`` directory from within the ``nengo-fpga`` root folder. This will
print the Device ID as well as save it to a file for future reference. The
script requires that you provide the name of your board as it appears in the
``fpga_config`` file (eg. pynq, de1). From the root directory (``nengo-fpga``)
run:

.. code-block:: bash

   python nengo_fpga/id_extractor.py <board>

After running this script you will see some information printed to the console
indicating the status of the NengoFPGA system. Upon successful execution
of the script the final lines should read:

.. code-block:: none

   Found board ID: 0X0123456789ABCDEF
   Written to file id_<board>.txt

Now that you have your Device ID, you are ready to
:ref:`acquire your bitstreams <get-bitstreams>`.

Bitstreams
==========

Compiled FPGA designs are binary files that configure the hardware, literally
strings of bits, so compiled designs are often called *bitstreams*. When getting
started or updating you NengoFPGA system, you will need to get bitstreams for
your device.


.. _get-bitstreams:

Acquiring NengoFPGA Bitstreams
------------------------------

If you haven't already, you will need to :ref:`get your Device ID <device-id>`.

To receive your tailored bitstreams, please send us an email at
`support@appliedbrainresearch.com`_ with the following information:

- Your Device ID. Either the hex string itself or attach the ``id_<board>.txt``
  file to the email.
- Which :ref:`supported hardware device <supported-hardware>` is associated with
  that Device ID.
- To help our support team provide a prompt response, please start your
  subject header with the term "NengoFPGA".


.. _support@appliedbrainresearch.com:
   mailto:support@appliedbrainresearch.com?subject=NengoFPGA\ -\


.. _update-bitstreams:

Updating NengoFPGA Bitstreams
-----------------------------

Once you have received your bitstreams, follow documentation for your particular
FPGA device for how to copy them to the board and get them running:

- :ref:`Updating bitstreams for Terasic DE1-SoC
  <nengo-de1:/usage.rst#updating-bitstreams>`
  (Intel Cyclone V)
- :ref:`Updating bitstreams for Digilent PYNQ
  <nengo-pynq:/usage.rst#updating-bitstreams>` (Xilinx Zynq)

